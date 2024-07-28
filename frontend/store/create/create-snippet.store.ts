import {defineStore} from 'pinia';

interface ApiResponse {
    shortid: string;
    language: string;
    timeAdded: Date;
}

interface CreateSnippetStore {
    language: string;
    code: string;
    viewPassword?: string | null;
    editPassword?: string | null;
    author?: string | null;
}

const snippetDefault: CreateSnippetStore = {
    language: '',
    code: '',
    viewPassword: null,
    editPassword: null,
    author: `Undefined-${Math.random().toString(36).substring(7)}`,
};

export const useCreateSnippetStore = defineStore('createSnippet', {
    state: () => snippetDefault,
    actions: {
        async create(input: CreateSnippetStore): Promise<ApiResponse> {
            const api = useApi();
            const { data } = await api.post('/code/create', input);
            return data;
        },
    },
});