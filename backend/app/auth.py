import os
import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from functools import lru_cache
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Security scheme for JWT token extraction
security = HTTPBearer()


class EntraJWTConfig:
    """Configuration for Entra (Azure AD) JWT validation"""

    def __init__(self):
        self.tenant_id = settings.AZURE_TENANT_ID
        self.client_id = settings.AZURE_CLIENT_ID
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        self.openid_config_url = (
            f"{self.authority}/v2.0/.well-known/openid-configuration"
        )
        self.issuer = f"{self.authority}/v2.0"

        # Environment settings
        self.env = os.environ.get("ENV", "dev")
        self.skip_auth = self.env in ["dev", "test"]

        if not self.skip_auth and (not self.tenant_id or not self.client_id):
            raise ValueError(
                "AZURE_TENANT_ID and AZURE_CLIENT_ID must be set for JWT validation"
            )


# Global config instance
jwt_config = EntraJWTConfig()


@lru_cache(maxsize=1)
async def get_jwks() -> Dict[str, Any]:
    """Fetch and cache the JSON Web Key Set from Azure AD"""
    try:
        async with httpx.AsyncClient() as client:
            # Get OpenID configuration
            openid_response = await client.get(jwt_config.openid_config_url)
            openid_response.raise_for_status()
            openid_config = openid_response.json()

            # Get JWKS
            jwks_response = await client.get(openid_config["jwks_uri"])
            jwks_response.raise_for_status()
            return jwks_response.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify JWT token",
        )


def find_key(jwks: Dict[str, Any], kid: str) -> Optional[Dict[str, Any]]:
    """Find the correct key from JWKS based on kid"""
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return the payload"""
    try:
        # Get unverified header to find the key ID
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing key ID",
            )

        # Get JWKS and find the correct key
        jwks = await get_jwks()
        key = find_key(jwks, kid)

        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: key not found",
            )

        # Verify and decode the token
        payload = jwt.decode(
            token,
            key,
            algorithms=[unverified_header.get("alg", "RS256")],
            audience=jwt_config.client_id,
            issuer=jwt_config.issuer,
        )

        return payload

    except JWTError as e:
        logger.warning(f"JWT validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT token"
        )
    except Exception as e:
        logger.error(f"Unexpected error during JWT validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token validation error",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user.
    In dev/test environments, this can be bypassed.
    """
    # Skip authentication in dev/test environments
    if jwt_config.skip_auth:
        logger.info(f"Skipping JWT validation in {jwt_config.env} environment")
        return {
            "sub": "dev-user",
            "name": "Development User",
            "preferred_username": "dev@example.com",
            "aud": "dev-client",
            "iss": "dev-issuer",
            "env": jwt_config.env,
        }

    # Verify JWT token in production
    token = credentials.credentials
    payload = await verify_jwt_token(token)

    logger.info(
        f"Successfully authenticated user: {payload.get('preferred_username', 'unknown')}"
    )
    return payload


# Optional: Create a dependency that only returns user info without enforcing auth
async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[Dict[str, Any]]:
    """
    Optional authentication dependency - returns None if no token provided
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
