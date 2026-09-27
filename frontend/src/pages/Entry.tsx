import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useEntry } from '@/contexts/EntryContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/AppLayout';
import { Loader2, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type EntryForm = {
  name: string;
};

export default function EntryPage() {
  const navigate = useNavigate();
  const { createEntry } = useEntry();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const form = useForm<EntryForm>({
    defaultValues: { name: '' },
    mode: 'onChange',
  });

  const createMutation = useMutation({
    mutationFn: (data: EntryForm) => createEntry(data.name),
    onSuccess: () => {
      toast.success('Welcome to Binomi!');
      navigate('/questionnaire');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create entry'),
  });

  const onSubmit = (data: EntryForm) => {
    if (!data.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    createMutation.mutate(data);
  };

  if (!mounted) return null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 py-12">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Welcome to Binomi</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered roommate matching for Tunisia. Just enter your name to get started.
            </p>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-xl">Enter your name</CardTitle>
              <CardDescription>No signup, no login — just your name</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    {...form.register('name', { required: 'Name is required' })}
                    placeholder="e.g., Ahmed, Fatma, Youssef"
                    disabled={createMutation.isPending}
                    className="text-center text-lg"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Entering...
                    </>
                  ) : (
                    <>
                      <User size={16} /> Continue
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our use of AI agents for roommate matching.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}