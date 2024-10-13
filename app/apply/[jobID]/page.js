import JobApplyForm from '../../components/JobApplyForm';
import { useRouter } from 'next/router';

export default function ApplyPage() {
  const router = useRouter();
  const { jobID } = router.query;

  return (
    <div>
      <h1>Apply for Job ID: {jobID}</h1>
      <JobApplyForm jobID={jobID} />
    </div>
  );
}
