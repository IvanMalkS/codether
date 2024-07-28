import type {RouteParamValue} from "vue-router";

interface updateSnippetStore {
    code: string;
    timeAdded?: Date;
    timeExpired?: Date;
    viewPassword?: string | null;
    editPassword: string;
}

const defaultUpdateSnippetStore: updateSnippetStore = {
    code: '',
    timeAdded: new Date(),
    timeExpired: new Date(),
    viewPassword: null,
    editPassword: '',
};

export const useUpdateSnippetStore = defineStore('updateSnippet', {
    state: () => ({ ...defaultUpdateSnippetStore }),
    actions: {
        async update(shortid: string | RouteParamValue[], input: updateSnippetStore): Promise<updateSnippetStore> {
            const api = useApi();
            const response = await api.post(`/code/update/${shortid}`, input);
            const { code, timeAdded, timeExpired } = response.data;
            this.$patch({ code, timeAdded, timeExpired });
            return response.data;
        },
    },
});