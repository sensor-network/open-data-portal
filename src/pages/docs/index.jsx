import { useRouter } from "next/router";
import { useEffect } from "react";

const LATEST_VERSION = "/docs/v2";

/* This page is just a redirect to the latest documentation version */
const RedirectDocsPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push(LATEST_VERSION);
  }, [router]);
  return <div>Redirecting to latest version</div>;
};
export default RedirectDocsPage;