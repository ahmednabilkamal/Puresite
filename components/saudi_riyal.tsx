import React from "react";
import SaudiRiyalSymbol from "../assets/icons/Saudi_Riyal_Symbol.svg";

interface SaudiRiyalProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function Saudi_riyal({ width = 20, height = 20, color }: SaudiRiyalProps) {
  return <SaudiRiyalSymbol width={width} height={height} fill={color} color={color} />;
}
