import { NFTStorage } from 'nft.storage'
import { extractActualDataFromIPFS } from './extractActualDataFromIPFS'
import { NFT_STORAGE_TOKEN } from '../constants/env-variables'

export default async function fileUploaderToNFTStorage(
    file: any,
    id: string,
    format: string,
    type: string
) {
    let url = null
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
            description: `Semester result of the ${id}`,
        }
        const value = await nftstorage.store({
            image: binaryFileWithMetaData,
            name: metadata.name,
            description: metadata.description,
        })
        console.log(value.url)
        url = await extractActualDataFromIPFS(value.url, format)
    } catch (error) {
        console.log(error)
        throw new Error(error?.message)
    }
    return url
}
