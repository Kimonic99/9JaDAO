import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x5468D8DDCe0b098620144573DF796D1E5972603f");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "Access Flag",
        description: "This NFT will give you access to 9jaDAO!",
        image: readFileSync("scripts/assets/9ja.jpg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();