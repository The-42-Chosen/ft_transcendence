"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Items = {
  title: string;
  text1: string;
  text2: string;
  text3: string;
};

export default function GameModal ({title, text1, text2, text3}: Items) {
  return (
	<div className="bg-amber-100 p-6 m-4 rounded-2xl">
        <div>
          <h3 className="pb-4">{title}</h3>
          <div>
            <ul className="grid grid-cols-3 gap-1">
              <li className="rounded-2xl text-center cursor-pointer bg-amber-600 p-3">{text1}</li>
              <li className="rounded-2xl text-center cursor-pointer bg-amber-600 p-3">{text2}</li>
              <li className="rounded-2xl text-center cursor-pointer bg-amber-600 p-3">{text3}</li>
            </ul>
          </div>
        </div>
      </div>
  );
}