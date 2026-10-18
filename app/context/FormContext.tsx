
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type EditMode = "melo" | "recommendation" | null;

export type FormState = {
  colour: string;
  faceIndex: number;
  displayName: string;
  prompt: string;
  songName: string;
  songArtist: string;
  songAlbum: string;
  songAlbumCover: string;
  songYear: string;
  songId: string;
  songDuration: number;
  message: string;
  editMode: EditMode;
  isEditing?: boolean;
  returnTo?: string;
};

type FormContextType = {
  formData: FormState;
  updateForm: (data: Partial<FormState>) => void;
  clearForm: () => void;
};

const defaultState: FormState = {
  colour: "#3B82F6",
  faceIndex: 0,
  displayName: "",
  prompt: "",
  songName: "",
  songArtist: "",
  songAlbum: "",
  songAlbumCover: "",
  songYear: "",
  songId: "",
  songDuration: 0,
  message: "",
  editMode: null,
  isEditing: false,
  returnTo: undefined,
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormState>(defaultState);

  const updateForm = (data: Partial<FormState>) => {
    setFormData((previous) => ({ ...previous, ...data }));
  };

  const clearForm = () => {
    setFormData(defaultState);
  };

  return (
    <FormContext.Provider value={{ formData, updateForm, clearForm }}>
      {children}
    </FormContext.Provider>
  );
}

export const useFormStore = () => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("useFormStore must be used within a FormProvider");
  }

  return context;
};
