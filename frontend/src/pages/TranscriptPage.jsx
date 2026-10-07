import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Topbar from '../components/Topbar';
import GlassBanner from '../components/GlassBanner';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const OFFICIAL_SAMPLE_TRANSCRIPT = `Meeting: NovaWorks Client Delivery Planning
Date: 7 October 2026 | Scheduled duration: 60 minutes
Participants: Ayesha, Bilal, Hina, Ali, Hamza, Sara, Usman, Zain, Maryam

09:00-09:04 | Opening and company workflow
Ayesha: Good morning. We have three client engagements to plan today: UrbanCart Clothing's website, QuickServe's customer mobile app, and HelpDeskPro's AI support assistant. Please keep these as three separate projects. A combined project would make client reporting confusing.
Bilal: We should finish with a project manager, deadline, task owner, and estimated hours for every piece of work. The estimate is effort, not the number of days between start and end.
Hina: Agreed. And each task must belong to a single owner from our team. If someone needs help, they still have one primary owner.

09:04-09:08 | UrbanCart scope and manager
Ayesha: Let's start with UrbanCart Clothing. This is a responsive website to browse products, view details, and use a demo cart. No payment gateway or inventory integration for this phase. The client explicitly pushed payments to a future contract, so keep payment processing out of this scope.
Bilal: Who is managing UrbanCart?
Ayesha: I will manage UrbanCart Website.
Bilal: Noted. What is the delivery deadline?
Ayesha: Tentatively 18 October, but let's confirm after reviewing the tasks.

09:08-09:12 | UrbanCart frontend tasks
Ali: I can take the frontend work. Product catalog UI will take 12 hours, due 12 October. That covers product listing, the detail screen, and responsive layout.
Ayesha: Good. And the demo cart?
Ali: Demo cart UI will be 8 hours, due 15 October. That includes adding/removing items, quantities, and a visible total. We don't need checkout processing or payment forms.
Ayesha: Agreed: catalog UI 12 hours on 12 October; cart UI 8 hours on 15 October. Both owned by Ali.

09:12-09:16 | UrbanCart backend and delivery correction
Hamza: For Product and cart APIs, I estimate 14 hours. I own it, and the deadline is 14 October. I will provide product responses and the demo cart endpoints Ali needs.
Ayesha: Good. After that, Ali owns Website integration and testing. Let's start with a six-hour estimate and a 17 October deadline.
Ali: Six hours is reasonable for connecting the screens and checking the demo flow. But please move that task to 19 October. I need a little more calendar space after the API work.
Ayesha: Accepted. Website integration and testing is 6 hours, due 19 October. Also, the client has just confirmed that final project delivery can be 20 October. That replaces the earlier 18 October date. The final UrbanCart project deadline is 20 October.
Hamza: So the final website plan has four tasks, and the new deadline is 20 October. No payment gateway in this phase.
Ayesha: Correct.

09:16-09:20 | QuickServe scope and manager
Bilal: Next is QuickServe Services. The project is QuickServe Mobile App. A customer mobile app demo built in Flutter: login, service booking, and booking status.
Ayesha: Are maps or live driver tracking included?
Bilal: No. The client asked about live GPS and map tracking, but we explicitly rejected that for this initial demo. Booking status will be a simple status badge and updates from the backend. No payment integration either.
Hina: Who is managing QuickServe?
Bilal: I am managing QuickServe Mobile App. The delivery deadline is 24 October.

09:20-09:24 | QuickServe mobile screens
Sara: I will take the customer screens. Login and profile screens: 8 hours, deadline 12 October.
Bilal: And the service booking screens?
Sara: Service booking screens will take 12 hours, deadline 17 October. That covers selecting a service, entering request details, and a confirmation screen.
Bilal: Agreed. Sara owns Login and profile screens (8 hours, 12 October) and Service booking screens (12 hours, 17 October).

09:24-09:28 | QuickServe backend APIs
Hamza: I can handle the backend here too. Booking and account APIs: 16 hours, due 16 October. That provides customer account handling, service requests, and request status.
Bilal: Good. This is still one API task under QuickServe. There is no new shared platform project.

09:28-09:32 | QuickServe integration estimate correction
Usman: I will own Mobile integration and testing. Initially I would put it at 8 hours, due 22 October.
Sara: Can that cover the booking status screen, error states, and testing login through booking? Eight sounds a little tight.
Usman: You're right. Make the final estimate 10 hours. Keep the task deadline at 22 October. I will connect the mobile UI to the API, display request status, and test the whole customer flow.
Bilal: Final agreement: Mobile integration and testing, Usman, 10 hours, 22 October. QuickServe still delivers on 24 October. Don't keep the earlier eight-hour estimate.
Ayesha: That's four tasks for QuickServe as well. We are not adding maps or payment tasks.

09:32-09:36 | HelpDeskPro scope and manager
Hina: Third project is HelpDeskPro AI Assistant, for client HelpDeskPro Solutions. An AI-powered support assistant that answers questions from a supplied FAQ document and escalates unresolved questions to human support.
Ayesha: Are we integrating directly into their ticketing tool or email server?
Hina: No, out of scope. For this milestone, escalation just means saving unresolved queries to an escalation queue table with customer contact info so a support rep can review them.
Bilal: Who manages this?
Hina: I will manage HelpDeskPro AI Assistant. Delivery deadline is 22 October.

09:36-09:40 | HelpDeskPro document processing
Maryam: I will own FAQ document processing. That means parsing the FAQ document, chunking content, and setting up the local retrieval store. I estimate 10 hours, deadline 13 October.
Hina: Perfect: Maryam, 10 hours, 13 October.

09:40-09:44 | HelpDeskPro answer generation and escalation
Zain: I will take Assistant answer generation: 14 hours, deadline 17 October. That covers prompt construction, calling the model, and returning structured answers. When the model cannot answer from the FAQ, it signals that it cannot resolve the request.
Hina: And the escalation path?
Zain: Human escalation flow: 6 hours, deadline 18 October. That takes unresolved questions and saves them for human review.
Hina: That works: Zain owns Assistant answer generation (14 hours, 17 October) and Human escalation flow (6 hours, 18 October).
Maryam: What about testing?
Hina: Exactly. Also, the client mentioned someone called Kamran who may supply a document later. Kamran is not a NovaWorks employee. Do not add him to our team or assign development work to him.

09:44-09:48 | HelpDeskPro testing owner correction
Hina: For Assistant evaluation and testing, I was initially considering Zain as the owner. We need to test FAQ answers, unsupported questions, and the escalation path.
Maryam: I can own that instead. It would be better if someone other than the answer-generation developer checks the results.
Hina: Agreed. Replace the earlier suggestion: Maryam is the final owner of Assistant evaluation and testing.
Maryam: Put the estimate at 8 hours, due 21 October. I'll include normal questions and missing-answer cases. That is separate from my ten-hour FAQ document task.
Hina: Confirmed: Maryam, 8 hours, 21 October. Final HelpDeskPro deadline stays 22 October.

09:48-09:52 | Final recap
Ayesha: UrbanCart Website, client UrbanCart Clothing, manager Ayesha, deadline 20 October. Ali owns Product catalog UI: 12 hours, 12 October. Ali owns Demo cart UI: 8 hours, 15 October. Hamza owns Product and cart APIs: 14 hours, 14 October. Ali owns Website integration and testing: 6 hours, 19 October.
Bilal: QuickServe Mobile App, client QuickServe Services, manager Bilal, deadline 24 October. Sara owns Login and profile screens: 8 hours, 12 October. Sara owns Service booking screens: 12 hours, 17 October. Hamza owns Booking and account APIs: 16 hours, 16 October. Usman owns Mobile integration and testing: 10 hours, 22 October.
Hina: HelpDeskPro AI Assistant, client HelpDeskPro Solutions, manager Hina, deadline 22 October. Maryam owns FAQ document processing: 10 hours, 13 October. Zain owns Assistant answer generation: 14 hours, 17 October. Zain owns Human escalation flow: 6 hours, 18 October. Maryam owns Assistant evaluation and testing: 8 hours, 21 October.
Ayesha: Those are the final decisions. Keep the rejected features out. The company already has its nine employees. Create three projects with twelve tasks, then show them in the CRM. That's all for this meeting.`;

export default function TranscriptPage() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: idle, 1: sending to AI, 2: validating, 3: committing, 4: done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handlePreFill = () => {
    setTranscript(OFFICIAL_SAMPLE_TRANSCRIPT);
    setError('');
    setResult(null);
  };

  const handleClear = () => {
    setTranscript('');
    setError('');
    setResult(null);
    setStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError('Please paste or load a meeting transcript before submitting.');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);
    setStep(1);

    try {
      // Simulate step progression UX
      setTimeout(() => setStep(2), 600);
      setTimeout(() => setStep(3), 1200);

      const res = await api.createFromTranscript(transcript);
      setStep(4);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to process transcript.');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar
        title="AI Meeting Transcript Conversion"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn ghost" onClick={handlePreFill} disabled={loading}>
              <FileText size={16} />
              <span>Load Official Transcript</span>
            </button>
            <button className="btn ghost" onClick={handleClear} disabled={loading}>
              <span>Clear</span>
            </button>
          </div>
        }
      />

      <GlassBanner
        badge="GEMINI 2.5 AI ENGINE"
        badgeColor="orange"
        title="Zero-Loss Autonomous Meeting Parser"
        description="Extracts multi-project scopes, manager assignments, estimated effort hours, and deadlines directly into execution tasks."
        stats={[
          { label: 'Pipeline', value: 'Atomic Batch', color: '#16a34a' },
          { label: 'Fallback', value: 'Dynamic Pattern', color: '#ea580c' }
        ]}
      />

      {error && (
        <div className="alert error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} />
          <div>{error}</div>
        </div>
      )}

      {result && (
        <div className="alert success" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 size={20} />
            <span className="strong">Extraction and Transaction Successful!</span>
          </div>
          <div>
            Created <strong>{result.projectsCreated} projects</strong> and <strong>{result.tasksCreated} tasks</strong> atomically in the database.
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {result.projects?.map((p) => (
              <button
                key={p.id}
                className="btn primary small"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <span>{p.name} ({p.taskCount} tasks)</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="two-col">
        <form onSubmit={handleSubmit}>
          <label>
            Meeting Transcript Input
            <textarea
              className="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste meeting transcript here..."
              disabled={loading}
              required
            />
          </label>

          <div className="btn-row">
            <button className="btn primary" type="submit" disabled={loading || !transcript.trim()}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Processing Transcript with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create Projects & Tasks</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div>
          <div className="card" style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Pipeline Execution Steps</h3>
            <ul className="steps">
              <li className={step >= 1 ? (step > 1 ? 'done' : 'active') : ''}>
                <span>{step > 1 ? '✓' : '1.'}</span>
                <span>Send transcript to Gemini LLM</span>
              </li>
              <li className={step >= 2 ? (step > 2 ? 'done' : 'active') : ''}>
                <span>{step > 2 ? '✓' : '2.'}</span>
                <span>Enforce Pydantic & business rules</span>
              </li>
              <li className={step >= 3 ? (step > 3 ? 'done' : 'active') : ''}>
                <span>{step > 3 ? '✓' : '3.'}</span>
                <span>Resolve manager & assignee references</span>
              </li>
              <li className={step >= 4 ? 'done' : ''}>
                <span>{step >= 4 ? '✓' : '4.'}</span>
                <span>Atomic database transaction</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 10px 0' }}>Extraction Rules</h3>
            <div className="muted small" style={{ lineHeight: 1.6 }}>
              • Final decisions override earlier proposals<br />
              • Excludes payment gateway, inventory, GPS<br />
              • Non-employee mentions (e.g. Kamran) rejected<br />
              • All-or-nothing rollback on any validation error
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
