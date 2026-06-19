import { create } from "zustand";

declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>;
                isSignedIn: () => Promise<boolean>;
                signIn: () => Promise<void>;
                signOut: () => Promise<void>;
            };
            fs: {
                write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
                read: (path: string) => Promise<Blob>;
                upload: (file: File[] | Blob[]) => Promise<FSItem>;
                delete: (path: string) => Promise<void>;
                readdir: (path: string) => Promise<FSItem[] | undefined>;
            };
            ai: {
                chat: (
                    prompt: string | ChatMessage[],
                    imageURL?: string | PuterChatOptions,
                    testMode?: boolean,
                    options?: PuterChatOptions
                ) => Promise<Object>;
                img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
            };
            kv: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<boolean>;
                delete: (key: string) => Promise<boolean>;
                list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
                flush: () => Promise<boolean>;
            };
        };
    }
}

interface PuterStore {
    isLoading: boolean;
    error: string | null;
    puterReady: boolean;
    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getUser: () => PuterUser | null;
    };
    fs: {
        write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (file:File[]) => Promise<FSItem | undefined>; // Fixed type definition union
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };
    ai: {
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => Promise<AIResponse | undefined>;
        feedback: (path: string, message: string) => Promise<AIResponse | undefined>;
        img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string | undefined>;
    };
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[] | KVItem[] | undefined>;
        flush: () => Promise<boolean | undefined>;
    };
    init: () => void;
    clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {

    // Helper to safely preserve function bindings when updating state
    const setError = (msg: string) => {
        set((state) => ({
            error: msg,
            isLoading: false,
            auth: {
                ...state.auth,
                user: null,
                isAuthenticated: false,
            },
        }));
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            const isSignedIn = await puter.auth.isSignedIn();
            if (isSignedIn) {
                const user = await puter.auth.getUser();
                set((state) => ({
                    auth: {
                        ...state.auth,
                        user,
                        isAuthenticated: true,
                        getUser: () => user,
                    },
                    isLoading: false,
                }));
                return true;
            } else {
                set((state) => ({
                    auth: {
                        ...state.auth,
                        user: null,
                        isAuthenticated: false,
                        getUser: () => null,
                    },
                    isLoading: false,
                }));
                return false;
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to check auth status";
            setError(msg);
            return false;
        }
    };

    const signIn = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signIn();
            await checkAuthStatus();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign in failed";
            setError(msg);
        }
    };

    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signOut();
            set((state) => ({
                auth: {
                    ...state.auth,
                    user: null,
                    isAuthenticated: false,
                    getUser: () => null,
                },
                isLoading: false,
            }));
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign out failed";
            setError(msg);
        }
    };

    const refreshUser = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const user = await puter.auth.getUser();
            set((state) => ({
                auth: {
                    ...state.auth,
                    user,
                    isAuthenticated: true,
                    getUser: () => user,
                },
                isLoading: false,
            }));
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to refresh user";
            setError(msg);
        }
    };

    const init = (): void => {
        const puter = getPuter();
        if (puter) {
            set({ puterReady: true });
            checkAuthStatus();
            return;
        }

        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                checkAuthStatus();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            if (!getPuter()) {
                setError("Puter.js failed to load within 10 seconds");
            }
        }, 10000);
    };

    // Core underlying API method executions
    const write = async (path: string, data: string | File | Blob) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.fs.write(path, data);
    };

    const readDir = async (path: string) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.fs.readdir(path);
    };

    const readFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.fs.read(path);
    };

    const upload = async (files: (File | Blob)[]) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.fs.upload(files);
    };

    const deleteFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.fs.delete(path);
    };

    const chat = async (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<AIResponse | undefined>;
    };

    const feedback = async (path: string, message: string) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");

        return puter.ai.chat(
            [
                {
                    role: "user",
                    content: [
                        { type: "file", puter_path: path },
                        { type: "text", text: message },
                    ],
                },
            ],
            { model: "claude-3-5-sonnet" } // Fixed model string identifier to match standard Puter.js bindings
        ) as Promise<AIResponse | undefined>;
    };

    const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
        const puter = getPuter();
        if (!puter) throw new Error("Puter.js not available");
        return puter.ai.img2txt(image, testMode);
    };

    return {
        isLoading: false,
        error: null,
        puterReady: false,
        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser: () => get().auth.user,
        },
        fs: {
            write: (path, data) => write(path, data),
            read: (path) => readFile(path),
            readDir: (path) => readDir(path),
            upload: (files) => upload(files),
            delete: (path) => deleteFile(path),
        },
        ai: {
            chat: (prompt, imageURL, testMode, options) => chat(prompt, imageURL, testMode, options),
            feedback: (path, message) => feedback(path, message),
            img2txt: (image, testMode) => img2txt(image, testMode),
        },
        kv: {
            get: (key) => puter.kv.get(key),
            set: (key, value) => puter.kv.set(key, value),
            delete: (key) => puter.kv.delete(key),
            list: (pattern, returnValues) => puter.kv.list(pattern, returnValues ?? false),
            flush: () => puter.kv.flush(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});