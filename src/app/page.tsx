import { redirect } from "next/navigation";

/** Temporary: land on concept 01 until a concept is chosen. */
export default function Home() {
  redirect("/pipeline");
}
