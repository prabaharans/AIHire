import { useRoute } from "wouter";
import { useGetJob, useListApplications } from "@workspace/api-client-react";
export default function JobDetail() { 
  const [, params] = useRoute("/jobs/:id");
  const id = Number(params?.id);
  const { data: job } = useGetJob(id, { query: { enabled: !!id } });
  
  return <div className="p-8">Job Detail Placeholder for: {job?.title}</div>; 
}