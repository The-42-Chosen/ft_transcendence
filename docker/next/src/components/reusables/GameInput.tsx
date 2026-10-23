"use client";

import { useId } from "react";

type Items = {
  title: string;
  label: string;
  info: string;
};

export default function GameInput ({title, label, info}: Items) {
  const inputId = useId();

  return (
    <div className="bg-amber-100 p-6 m-4 rounded-2xl">
      <div>
        <h3 className="pb-4">{title}</h3>
        <form>
          <div className="gap-2">
            <label htmlFor={inputId} className="rounded-2xl text-center p-3">{label}</label>
            <input name="inpt" id={inputId} required className="rounded-2xl text-center bg-amber-600 p-3"/>
            {info && (
              <p className="pt-2">ℹ️ {info}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
