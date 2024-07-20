import { defineStore } from 'pinia';
import axios from 'axios';
import {useApi} from "~/composables/usaApi";
const api = useApi()

interface FindSnippetStore {
    id: number;
    language: string;
    code: string;
    timeAdded: Date;
    viewPassword?: string | null;
}

const defaultFindSnippetStore: FindSnippetStore = {
    id: 0,
    language: '',
    code: '',
    timeAdded: new Date(),
    viewPassword: null,
};

export const useFindSnippetStore = defineStore('findSnippet', {
    state: () => ({ ...defaultFindSnippetStore }),
    actions: {
        async find(id: number, viewPassword?: string): Promise<void> {
            try {
                const response = await api.post(`/code/get/${id}`, { viewPassword });
                const { language, code, timeAdded } = response.data;
                this.$patch({ language, code, timeAdded });
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    throw new Error(JSON.stringify(error.response.data));
                } else {
                    throw error;
                }
            }
        }
    },
});
