'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  params: { modelId: string };
}

export default function ModelPage({ params }: Props) {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/stats/${params.modelId}`);
  }, [params.modelId, router]);
  
  return null;
}