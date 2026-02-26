import axios from "axios";
import Cookies from "js-cookie";
import 'dotenv/config';
import { toast } from "sonner";

const getAuthToken = () => Cookies.get('auth_token');

export const getter = async (url: string) => {
  try {
    const result = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return result.data;
  } catch (error) {
    toast.error(`Something went wrong: Please try again`);
  }
};

export const poster = async (url: string, data: any) => {
  try {
    const result = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return result.data;
  } catch (error) {
    toast.error(`Something went wrong: Please try again`);
  }
};

export const putter = async (url: string, data: any) => {
  try {
    const result = await axios.put(url, data, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return result.data;
  } catch (error) {
    toast.error(`Something went wrong: Please try again`);
  }
};
export const deleter = async (url: string) => {
  try {
    const result = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return result.data;
  } catch (error) {
    toast.error(`Something went wrong: Please try again`);
  }
};

export const preventRerendering = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
};
