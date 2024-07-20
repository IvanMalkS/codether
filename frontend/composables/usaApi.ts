import axios from 'axios';

const URL = 'http://localhost:3123';

export const useApi = () => {
    const api = axios.create({
        baseURL: URL,
    });

    return api;
};
