import { getData } from "@/server/api/action/cookies";
import ClientRender from "./client";




export default async function Home() {
  const cookieData = await getData("data");
  return (
    <ClientRender data={cookieData ?? []} />
  )
}