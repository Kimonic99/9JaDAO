import React from 'react';
import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";
import { ChainId } from '@thirdweb-dev/sdk'



const App = () => {
  const address = useAddress();
  const network = useNetwork();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  const editionDrop = useEditionDrop("0x5468D8DDCe0b098620144573DF796D1E5972603f");
  const token = useToken("0x413e87de2B632C18210068673b062014F3C6191b")
  const vote = useVote("0xAB151a5F3275F889fd0a16D9fE872eeCC2DbD366");
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing. 
  const shortenAddress = (str) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }
  const getAllProposals = async () => {
    try {
      const proposals = await vote.getAll();
      setProposals(proposals);
      console.log(" Proposals:", proposals);
    } catch (error) {
      console.log("failed to get proposals", error);
    }
  };
  getAllProposals();
}, [hasClaimedNFT, vote]);

  useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  if (!proposals.length) {
    return;
  }

  const checkIfUserHasVoted = async () => {
    try {
      const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("🥵 User has already voted");
      } else {
        console.log("🙂 User has not voted yet");
      }
    } catch (error) {
      console.error("Failed to check if wallet has voted", error);
    }
  };
  checkIfUserHasVoted();

}, [hasClaimedNFT, proposals, address, vote]);


  
  
  useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  const getAllAddresses = async () => {
    try {
      const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
      setMemberAddresses(memberAddresses);
      console.log("Members addresses", memberAddresses);
    } catch (error) {
      console.error("failed to get member list", error);
    }

  };
  getAllAddresses();
}, [hasClaimedNFT, editionDrop.history]);

  useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  const getAllBalances = async () => {
    try {
      const amounts = await token.history.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("Amounts", amounts);
    } catch (error) {
      console.error("failed to get member balances", error);
    }
  };
  getAllBalances();
}, [hasClaimedNFT, token.history]);

  const memberList = useMemo(() => {
  return memberAddresses.map((address) => {
  const member = memberTokenAmounts?.find(({ holder }) => holder === address);
  return {
      address,
      tokenAmount: member?.balance.displayValue || "0",
    }
  });
}, [memberAddresses, memberTokenAmounts]);


  useEffect(() => {
    if (!address) {
      return;
    }
    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim("0", 1);
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}`);
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (address && (network?.[0].data.chain.id !== ChainId.Goerli)) {
  return (
    <div className="unsupported-network">
      <h2>Please connect to Goerli</h2>
      <p>
        This dapp only works on the Goerli network, please switch networks
        in your connected wallet.
      </p>
    </div>
  );
}


  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to 9jaDAO</h1>
        <button onClick={connectWithMetamask} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }


  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>9jaDAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsVoting(true);

                const votes = proposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                try {
                  const delegation = await token.getDelegationOf(address);
                  if (delegation === AddressZero) {
                    await token.delegateTo(address);
                  }
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId, vote: _vote }) => {
                        const proposal = await vote.get(proposalId);
                        if (proposal.state === 1) {
                          return vote.vote(proposalId, _vote);
                        }
                        return;
                      })
                    );
                    try {
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          const proposal = await vote.get(proposalId);

                          if (proposal.state === 4) {
                            return vote.execute(proposalId);
                          }
                        })
                      );
                      setHasVoted(true);
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + type}
                          name={proposal.proposalId}
                          value={type}
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + type}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              {!hasVoted && (
                <small>
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  };

  
    return (
    <div className="mint-nft">
      <h1>Mint your free 9jaDAO Membership NFT   </h1>
      <button
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
}



export default App;
