"use strict";

import axios from "axios";

const testGet = async function () {
  try {
    const response = await axios.get("http://localhost:8000/");
    console.log("RECEIVED ", response.data.message);
  } catch (err) {
    console.log(err);
  }
};

const testPost = async function () {
  try {
    const item = { name: "LEGO PRESENT" };
    const response = await axios.post("http://localhost:8000/items", item);
    console.log("SENDING ", response.data.name);
  } catch (err) {
    console.log(err);
  }
};

testGet();
testPost();
