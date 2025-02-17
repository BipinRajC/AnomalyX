import { atom } from "recoil"

export const DFAtom = atom<string[] | null>({
    key: "DFAtom",
    default: null
})

export const FileNameAtom = atom<string | null>({
    key: "fileNameAtom",
    default: null
})