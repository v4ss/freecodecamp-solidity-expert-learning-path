import Image from "next/image";
import styles from "./page.module.css";
import ManualHeader from "../components/HeaManualHeaderder";

export default function Home() {
  return (
    <div>
      <ManualHeader />
      Hello !
    </div>
  );
}
