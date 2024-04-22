import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useConnect, metamaskWallet , useContractWrite, useDisconnect, useWallet  } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

const metamaskConfig = metamaskWallet();

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract('0x6A55F51bA8503d2339c6CC5767Ec9500Ec35dCAb');
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

    const address = useAddress();
    const connect = useConnect();
    // const disconnect = useDisconnect();

    const connectWallet = async() => {
        const wallet = await connect(metamaskConfig);
    }

    // const walletInstance = useWallet();

    const publishCampaign = async (form) => {
        try {
            const data = await createCampaign({
                args: [
                    address,    // owner address
                    form.title, // title
                    form.description,   // description
                    form.target,
                    new Date(form.deadline).getTime(),  // deadline
                    form.image,    
                ]
            })

            console.log("contract call success", data)
        } catch (error) {
            console.log("contract call failure", error)
        }
    }

    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns');

        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i
        }));

        return parsedCampaigns;
    }

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();

        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

        return filteredCampaigns;
    }
    
    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connectWallet,
                // disconnect,
                createCampaign: publishCampaign,
                // walletInstance
                getCampaigns,
                getUserCampaigns,
            }}
        >
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);