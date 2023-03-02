import Cookies from 'js-cookie';

export function getCookie(): string | null {
    const cookies = Cookies.get('access_token');
    console.log(cookies);
    //const access_token=cookies.find((token)=>token.includes('access_token'));
    return null;//access_token.toString();
  }