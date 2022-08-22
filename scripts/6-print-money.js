import sdk from "./1-initialize-sdk.js";


const token = sdk.getToken("0x413e87de2B632C18210068673b062014F3C6191b");

(async () => {
  try {
  
    const amount = 2_000_000;
    await token.mintToSelf(amount);
    const totalSupply = await token.totalSupply();

    console.log("✅ There now is", totalSupply.displayValue, "$9JA in circulation");
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();