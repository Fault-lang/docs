import{_ as a,o as n,c as e,a2 as p}from"./chunks/framework.mRCPFc5l.js";const m=JSON.parse('{"title":"Component State Machines","description":"","frontmatter":{"title":"Component State Machines"},"headers":[],"relativePath":"model-types/component-state-machines.md","filePath":"model-types/component-state-machines.md"}'),t={name:"model-types/component-state-machines.md"};function i(l,s,c,o,r,d){return n(),e("div",null,[...s[0]||(s[0]=[p(`<h1 id="component-state-machines" tabindex="-1">Component State Machines <a class="header-anchor" href="#component-state-machines" aria-label="Permalink to &quot;Component State Machines&quot;">​</a></h1><p>A component state machine model is the right choice when you want to reason about <strong>systems with distinct operating modes</strong> — services that can be healthy, degraded, or failed; protocols with handshake states; distributed systems where components influence each other&#39;s transitions.</p><p>These models live in a <code>.fsystem</code> file. The state machine defines <em>which mode</em> each component is in. Imported <code>.fspec</code> files define <em>what happens</em> during transitions.</p><p><strong>Use component state machine models when:</strong></p><ul><li>Your system has discrete, named operating modes</li><li>Different components interact by triggering each other&#39;s state changes</li><li>You want to check reachability (&quot;can the system reach this failure state?&quot;) or safety (&quot;can two components ever be in these states simultaneously?&quot;)</li></ul><hr><h2 id="worked-example-database-primary-replica-failover" tabindex="-1">Worked Example: Database Primary/Replica Failover <a class="header-anchor" href="#worked-example-database-primary-replica-failover" aria-label="Permalink to &quot;Worked Example: Database Primary/Replica Failover&quot;">​</a></h2><p>A database cluster has a primary node and a replica. When the primary fails, the replica should promote itself. We want to verify:</p><ol><li>There is never a moment where both nodes think they are primary</li><li>If the primary fails, the replica eventually promotes</li></ol><h3 id="defining-the-components" tabindex="-1">Defining the Components <a class="header-anchor" href="#defining-the-components" aria-label="Permalink to &quot;Defining the Components&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>system dbCluster;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>component primary = states{</span></span>
<span class="line"><span>    active: sfunc{</span></span>
<span class="line"><span>        advance(this.failing) || stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    failing: sfunc{</span></span>
<span class="line"><span>        advance(this.failed);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    failed: sfunc{</span></span>
<span class="line"><span>        stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>component replica = states{</span></span>
<span class="line"><span>    standby: sfunc{</span></span>
<span class="line"><span>        if primary.failed {</span></span>
<span class="line"><span>            advance(this.promoting);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            stay();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    promoting: sfunc{</span></span>
<span class="line"><span>        advance(this.active);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    active: sfunc{</span></span>
<span class="line"><span>        stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>States are functions. <code>advance()</code> transitions to the named state. <code>stay()</code> remains in the current state. States can be referenced as booleans in conditionals — <code>if primary.failed</code> is true when the <code>failed</code> state is active.</p><h3 id="cross-component-transitions" tabindex="-1">Cross-Component Transitions <a class="header-anchor" href="#cross-component-transitions" aria-label="Permalink to &quot;Cross-Component Transitions&quot;">​</a></h3><p>The replica&#39;s <code>standby</code> state watches <code>primary.failed</code> to decide when to start promoting. This is how Fault models inter-component signaling — no explicit messages, just state visibility.</p><p>The <code>||</code> in <code>active: sfunc{ advance(this.failing) || stay(); }</code> means the solver will explore both the &quot;stays active&quot; and &quot;starts failing&quot; paths when looking for counterexamples.</p><h3 id="writing-assertions" tabindex="-1">Writing Assertions <a class="header-anchor" href="#writing-assertions" aria-label="Permalink to &quot;Writing Assertions&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Safety: both nodes are never simultaneously active</span></span>
<span class="line"><span>assert !(primary.active &amp;&amp; replica.active);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Liveness: if primary fails, replica eventually becomes active</span></span>
<span class="line"><span>assert replica.active eventually;</span></span></code></pre></div><p>The first assertion is a safety property — something that should <em>never</em> happen. The second is a liveness property — something that <em>must eventually</em> happen.</p><h3 id="the-run-block" tabindex="-1">The Run Block <a class="header-anchor" href="#the-run-block" aria-label="Permalink to &quot;The Run Block&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>run {</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Each round runs both components concurrently. Fault explores whether the primary can fail and whether the replica responds correctly given the possible orderings.</p><h3 id="complete-model" tabindex="-1">Complete Model <a class="header-anchor" href="#complete-model" aria-label="Permalink to &quot;Complete Model&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>system dbCluster;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>component primary = states{</span></span>
<span class="line"><span>    active: sfunc{</span></span>
<span class="line"><span>        advance(this.failing) || stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    failing: sfunc{</span></span>
<span class="line"><span>        advance(this.failed);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    failed: sfunc{</span></span>
<span class="line"><span>        stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>component replica = states{</span></span>
<span class="line"><span>    standby: sfunc{</span></span>
<span class="line"><span>        if primary.failed {</span></span>
<span class="line"><span>            advance(this.promoting);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            stay();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    promoting: sfunc{</span></span>
<span class="line"><span>        advance(this.active);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    active: sfunc{</span></span>
<span class="line"><span>        stay();</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>assert !(primary.active &amp;&amp; replica.active);</span></span>
<span class="line"><span>assert replica.active eventually;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run {</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>    primary.active | replica.standby;</span></span>
<span class="line"><span>}</span></span></code></pre></div><hr><h2 id="adding-stock-flow-detail" tabindex="-1">Adding Stock-Flow Detail <a class="header-anchor" href="#adding-stock-flow-detail" aria-label="Permalink to &quot;Adding Stock-Flow Detail&quot;">​</a></h2><p>A pure state machine model is a <strong>Moore machine</strong> — it only reasons about which states are reachable. To model <em>how</em> transitions happen based on resource values, import a <code>.fspec</code> file.</p><p>For example, to model the primary only failing when its connection count drops to zero:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// connections.fspec</span></span>
<span class="line"><span>spec connections;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def pool = stock{</span></span>
<span class="line"><span>    active: 5,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def connMgr = flow{</span></span>
<span class="line"><span>    p: new pool,</span></span>
<span class="line"><span>    drain: func{</span></span>
<span class="line"><span>        p.active -&gt; 1;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    add: func{</span></span>
<span class="line"><span>        p.active &lt;- 1;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>assert pool.active &gt;= 0;</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// dbCluster.fsystem</span></span>
<span class="line"><span>system dbCluster;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import(&quot;connections.fspec&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>global conns = new connections.connMgr;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>component primary = states{</span></span>
<span class="line"><span>    active: sfunc{</span></span>
<span class="line"><span>        conns.drain;</span></span>
<span class="line"><span>        if connections.pool.active = 0 {</span></span>
<span class="line"><span>            advance(this.failing);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            stay();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The state machine now triggers the flow on each round. The transition to <code>failing</code> only happens when the resource condition is met.</p><hr><h2 id="key-concepts" tabindex="-1">Key Concepts <a class="header-anchor" href="#key-concepts" aria-label="Permalink to &quot;Key Concepts&quot;">​</a></h2><ul><li><strong><a href="./../language-reference/components.html">Components</a></strong> — component and states syntax</li><li><strong><a href="./../language-reference/states.html">States</a></strong> — state functions, advance/stay/leave, state as boolean</li><li><strong><a href="./../language-reference/fsystem_fspec.html">Fsystem and Fspec Files</a></strong> — file structure and imports</li><li><strong><a href="./../language-reference/time.html">Time</a></strong> — how rounds work with state machines</li><li><strong><a href="./../language-reference/special_syntax.html">Special Syntax</a></strong> — choose, pipe, when/then</li></ul>`,33)])])}const u=a(t,[["render",i]]);export{m as __pageData,u as default};
