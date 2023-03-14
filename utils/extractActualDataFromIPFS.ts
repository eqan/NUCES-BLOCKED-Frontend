import axios from 'axios'
export const regex = /ipfs:\/\/([a-zA-Z0-9]+)/
export const regex2 = /[^/]*$/

export const convertToHTTPAccessibleFormat = (hash: string, name: string) => {
    return `https://${hash}.ipfs.dweb.link/${name}`
}
export const extractTheLastWordAfterSlash = (url: string) => {
    return url.match(regex2)[0]
}
export const extractActualDataFromIPFS = async (
    url: string,
    format: string
) => {
    const hash = url.match(regex)[1]
    const response = await axios.get(
        convertToHTTPAccessibleFormat(hash, 'metadata.json')
    )
    const requiredHash = response.data.image.match(regex)[1]
    const name = response.data.name + format
    return convertToHTTPAccessibleFormat(requiredHash, name)
}
