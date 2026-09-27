import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { negotiationLogApi, matchesApi } from '@/lib/api';
import { Loader2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function NegotiationLogPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [logData, setLogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<any>(null);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    Promise.all([
      negotiationLogApi.get(matchId),
      matchesApi.get(matchId)
    ]).then(([log, match]) => {
      setLogData(log);
      setMatchInfo(match);
    }).catch(() => {
      navigate('/matches');
    }).finally(() => setLoading(false));
  }, [matchId, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!logData) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="font-display text-xl font-bold mb-2">Log not found</h2>
          <Button variant="outline" onClick={() => navigate('/matches')}>
            <ChevronLeft size={14} className="mr-1" /> Back to Matches
          </Button>
        </div>
      </AppLayout>
    );
  }

  const outcome = logData.outcome || {};
  const analysis = logData.analysis?.structured ? logData.analysis.data : null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Negotiation Log</h1>
            <p className="text-sm text-muted-foreground">Match: {matchId}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/matches')}>
            <ChevronLeft size={14} className="mr-1" /> Back
          </Button>
        </div>

        {/* Outcome */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Outcome</h3>
              <StatusBadge status={outcome.status} />
            </div>
            {outcome.reason && <p className="text-sm text-muted-foreground">{outcome.reason}</p>}
            {outcome.unresolved_topics?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Unresolved Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {outcome.unresolved_topics.map((t: string) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Created: {logData.created_at ? format(new Date(logData.created_at), 'MMM d, yyyy HH:mm') : '–'}
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle className="font-display text-lg">Compatibility Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-4xl font-bold text-primary">{analysis.scores?.overall ?? '–'}</p>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                  <StatusBadge status={analysis.recommendation || outcome.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {['finances', 'lifestyle', 'personality', 'logistics'].map(k => (
                    <div key={k} className="rounded-lg bg-muted p-3 text-center">
                      <p className="font-display text-2xl font-bold">{analysis.scores?.[k] ?? '–'}</p>
                      <p className="text-xs capitalize text-muted-foreground">{k}</p>
                    </div>
                  ))}
                </div>

                {analysis.dealbreaker_detected && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm font-semibold text-destructive">⚠️ Dealbreaker Detected</p>
                    <p className="text-sm text-destructive/80">{analysis.dealbreaker_detail}</p>
                  </div>
                )}

                {analysis.highlights?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">✅ Highlights</p>
                    <ul className="text-sm text-muted-foreground space-y-1">{analysis.highlights.map((h: string, i: number) => <li key={i}>• {h}</li>)}</ul>
                  </div>
                )}
                {analysis.concerns?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">⚠️ Concerns</p>
                    <ul className="text-sm text-muted-foreground space-y-1">{analysis.concerns.map((c: string, i: number) => <li key={i}>• {c}</li>)}</ul>
                  </div>
                )}
                {analysis.middle_ground?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">🤝 Middle Ground</p>
                    <ul className="text-sm text-muted-foreground space-y-1">{analysis.middle_ground.map((m: string, i: number) => <li key={i}>• {m}</li>)}</ul>
                  </div>
                )}
                {analysis.recommendation_summary && (
                  <div className="rounded-lg bg-accent p-3">
                    <p className="text-sm font-semibold mb-1">Summary</p>
                    <p className="text-sm text-muted-foreground">{analysis.recommendation_summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Conversation */}
        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Full Conversation</CardTitle></CardHeader>
          <CardContent className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
            {(logData.conversation || []).map((msg: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.speaker_id === 'a' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.speaker_id === 'a' ? 'bg-accent text-accent-foreground rounded-bl-sm' : 'bg-primary text-primary-foreground rounded-br-sm'
                }`}>
                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.speaker} <span className="text-xs text-muted-foreground">(Turn {msg.turn}, {msg.phase})</span></p>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}