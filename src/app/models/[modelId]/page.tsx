'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ModelPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.modelId as string;
  
  useEffect(() => {
    router.replace(`/stats/${modelId}`);
  }, [modelId, router]);
  
  return null;
}