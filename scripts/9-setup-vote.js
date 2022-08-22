import sdk from "./1-initialize-sdk.js";

// This is our governance contract.
const vote = sdk.getVote("0xAB151a5F3275F889fd0a16D9fE872eeCC2DbD366");

// This is our ERC-20 contract.
const token = sdk.getToken("0x413e87de2B632C18210068673b062014F3C6191b");

(async () => {
  try {
    
    await token.roles.grant("minter", vote.getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
    const ownedTokenBalance = await token.balanceOf(
      process.env.WALLET_ADDRESS
    );

    const ownedAmount = ownedTokenBalance.displayValue;
    const percent80 = Number(ownedAmount) / 100 * 80;

    await token.transfer(
      vote.getAddress(),
      percent80
    ); 

    console.log("✅ Successfully transferred " + percent80 + " tokens to vote contract");
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();