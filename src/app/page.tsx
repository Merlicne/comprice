import { getData } from "@/server/action/cookies";
import ClientRender from "./client";




export default async function Home() {
  const cookieData = await getData();
  return (
    <ClientRender data={cookieData ?? []} />
  )
}