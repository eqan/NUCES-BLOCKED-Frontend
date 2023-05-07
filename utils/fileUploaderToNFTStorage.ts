import { NFTStorage } from 'nft.storage'
import { extractActualDataFromIPFS } from './extractActualDataFromIPFS'
import { NFT_STORAGE_TOKEN } from '../constants/env-variables'

export default async function fileUploaderToNFTStorage(
    file: any,
    id: string,
    format: string,
    type: string,
    message: string
): Promise<string> {
    let url: string = null
    try {
        const nftstorage = new NFTStorage({
            token: NFT_STORAGE_TOKEN,
        })
        console.log(file)
        const binaryFileWithMetaData = new File([file], id + format, {
            type,
        })

        const metadata = {
            name: id,
            description: message,
        }
        const value = await nftstorage.store({
            image: binaryFileWithMetaData,
            name: metadata.name,
            description: metadata.description,
        })
        console.log(value.url)
        url = await extractActualDataFromIPFS(value.url, format)
        console.log(url)
    } catch (error) {
        console.log(error)
        throw new Error(error?.message)
    }
    return url
}
