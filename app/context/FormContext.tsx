"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type FormState = {
  // Avatar step
  colour: string;
  faceIndex: number;
  displayName: string;
  // Prompt step
  prompt: string;
  // Song step
  songName: string;
  songArtist: string;
  songAlbum: string;
  songAlbumCover: string,
  songYear: string;
  songId: string;
  // Message step
  message: string;
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
  message: "",
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormState>(defaultState);

  const updateForm = (data: Partial<FormState>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const clearForm = () => setFormData(defaultState);

  return (
    <FormContext.Provider value={{ formData, updateForm, clearForm }}>
      {children}
    </FormContext.Provider>
  );
}

export const useFormStore = () => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormStore must be used inside FormProvider");
  return ctx;
};