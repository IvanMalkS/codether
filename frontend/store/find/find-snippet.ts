import { defineStore } from 'pinia';
import { useApi } from '~/composables/usaApi';
import type { RouteParamValue } from 'vue-router';

const api = useApi();

interface FindSnippetStore {
    id: string;
    language: string;
    code: string;
    timeAdded: Date;
    viewPassword?: string | null;
}

interface FindSnippetResponse {
    code: string;
    timeExpired: Date;
    timeAdded: Date;
    language: string;
    author: string;
    shortid: string;
}

export interface FindSnippetError {
    errorCode: string;
    errorMessage: string;
    details?: Record<string, any>;
}

const defaultFindSnippetStore: FindSnippetStore = {
    id: '0',
    language: '',
    code: '',
    timeAdded: new Date(),
    viewPassword: null,
};

export const useFindSnippetStore = defineStore('findSnippet', {
    state: () => ({
        ...defaultFindSnippetStore,
        error: null as FindSnippetError | null,
    }),
    actions: {
        async find(id: string | RouteParamValue[], viewPassword?: string): Promise<FindSnippetResponse | null> {
            try {
                const response = await api.post(`/code/get/${id}`, { viewPassword });
                const { language, code, timeAdded, author, shortid } = response.data;
                this.$patch({ language, code, timeAdded });
                return response.data;
            } catch (error: unknown) {
                if (error && typeof error === 'object' && 'response' in error) {
                    this.error = (error as { response: { data: FindSnippetError } }).response.data;
                } else {
                    this.error = { errorCode: 'UNKNOWN_ERROR', errorMessage: 'An unknown error occurred' };
                }
                return null;
            }
        },
    },
});