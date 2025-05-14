import { getData } from "@/server/api/action/cookies";
import Page2 from "./page2";




export default async function Home() {
  const cookieData = await getData("data");
  return (
    <Page2 data={cookieData ?? []} />
  )
}