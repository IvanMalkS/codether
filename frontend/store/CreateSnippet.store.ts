import { defineStore } from 'pinia';
import type { AxiosResponse } from "axios";

interface CreateSnippetStore {
    language: string;
    code: string;
    viewPassword?: string | null;
    editPassword?: string | null;
}

const snippetDefault: CreateSnippetStore = {
    language: '',
    code: '',
    viewPassword: null,
    editPassword: null,
};

export const useCreateSnippetStore = defineStore('createSnippet', {
    state: () => snippetDefault,
    actions: {
        async create(input: CreateSnippetStore): Promise<AxiosResponse<Response>> {
            const api = useApi();
            const response = await api.post('/code/create', input);
            return response;
        },
    },
});
