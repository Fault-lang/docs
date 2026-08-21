import{_ as a,o as n,c as e,a2 as p}from"./chunks/framework.mRCPFc5l.js";const u=JSON.parse('{"title":"Boolean Logic Models","description":"","frontmatter":{"title":"Boolean Logic Models"},"headers":[],"relativePath":"model-types/boolean-logic.md","filePath":"model-types/boolean-logic.md"}'),l={name:"model-types/boolean-logic.md"};function i(t,s,o,c,r,d){return n(),e("div",null,[...s[0]||(s[0]=[p(`<h1 id="boolean-logic-models" tabindex="-1">Boolean Logic Models <a class="header-anchor" href="#boolean-logic-models" aria-label="Permalink to &quot;Boolean Logic Models&quot;">​</a></h1><p>A boolean logic model is the right choice when your system is best described in terms of <strong>propositions that are true or false</strong> rather than quantities that accumulate. You are reasoning about what combinations of facts can coexist, not about numeric values changing over time.</p><p>Fault supports pure boolean modeling through boolean stock fields and string fields, which are treated as boolean propositions in logical expressions.</p><p><strong>Use boolean logic models when:</strong></p><ul><li>Your system state is a set of flags or conditions, not numeric quantities</li><li>You want to check that certain combinations of facts are impossible</li><li>You are modeling access control, feature flags, protocol invariants, or logical constraints</li></ul><hr><h2 id="booleans-in-stocks" tabindex="-1">Booleans in Stocks <a class="header-anchor" href="#booleans-in-stocks" aria-label="Permalink to &quot;Booleans in Stocks&quot;">​</a></h2><p>Stock fields can hold <code>true</code> or <code>false</code>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def state = stock{</span></span>
<span class="line"><span>    authenticated: false,</span></span>
<span class="line"><span>    tokenIssued: false,</span></span>
<span class="line"><span>    accessGranted: false,</span></span>
<span class="line"><span>    sessionExpired: false,</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>Flow functions can set, unset, or combine these using <code>=</code>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def auth = flow{</span></span>
<span class="line"><span>    s: new state,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    login: func{</span></span>
<span class="line"><span>        s.authenticated = true;</span></span>
<span class="line"><span>        s.tokenIssued = true;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    grant: func{</span></span>
<span class="line"><span>        s.accessGranted = true;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    expire: func{</span></span>
<span class="line"><span>        s.sessionExpired = true;</span></span>
<span class="line"><span>        s.tokenIssued = false;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    revoke: func{</span></span>
<span class="line"><span>        s.accessGranted = false;</span></span>
<span class="line"><span>        s.authenticated = false;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span></code></pre></div><h3 id="assertions-over-booleans" tabindex="-1">Assertions Over Booleans <a class="header-anchor" href="#assertions-over-booleans" aria-label="Permalink to &quot;Assertions Over Booleans&quot;">​</a></h3><p>Use <code>&amp;&amp;</code>, <code>||</code>, and <code>!</code> to combine boolean stocks in assertions:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Access cannot be granted without authentication</span></span>
<span class="line"><span>assert when state.accessGranted then state.authenticated;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// A session cannot be both active and expired</span></span>
<span class="line"><span>assert !(state.accessGranted &amp;&amp; state.sessionExpired);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Once expired, token must be re-issued before access can be granted again</span></span>
<span class="line"><span>assert when state.sessionExpired then !state.tokenIssued;</span></span></code></pre></div><hr><h2 id="strings-as-propositions" tabindex="-1">Strings as Propositions <a class="header-anchor" href="#strings-as-propositions" aria-label="Permalink to &quot;Strings as Propositions&quot;">​</a></h2><p>String fields are treated as booleans in logical expressions. A string field is truthy — its truth value can be negated, ANDed, or ORed with other fields.</p><p>This lets you name boolean propositions with descriptive labels:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec featureFlags;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const (</span></span>
<span class="line"><span>    betaUsersOnly = &quot;only beta users see this&quot;</span></span>
<span class="line"><span>    adminRequired = &quot;requires admin role&quot;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def access = stock{</span></span>
<span class="line"><span>    isBetaUser: betaUsersOnly,</span></span>
<span class="line"><span>    isAdmin: adminRequired,</span></span>
<span class="line"><span>    featureVisible,              // unknown — solver picks</span></span>
<span class="line"><span>};</span></span></code></pre></div><h3 id="boolean-logic-on-strings" tabindex="-1">Boolean Logic on Strings <a class="header-anchor" href="#boolean-logic-on-strings" aria-label="Permalink to &quot;Boolean Logic on Strings&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>def rules = flow{</span></span>
<span class="line"><span>    a: new access,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    enableForBeta: func{</span></span>
<span class="line"><span>        a.featureVisible = a.isBetaUser;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    enableForAdmin: func{</span></span>
<span class="line"><span>        a.featureVisible = a.isAdmin;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Feature is only visible to beta users or admins</span></span>
<span class="line"><span>assert when access.featureVisible then (access.isBetaUser || access.isAdmin);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Feature cannot be visible to a non-admin non-beta user</span></span>
<span class="line"><span>assert !(access.featureVisible &amp;&amp; !access.isBetaUser &amp;&amp; !access.isAdmin);</span></span></code></pre></div><hr><h2 id="worked-example-mutex-protocol" tabindex="-1">Worked Example: Mutex Protocol <a class="header-anchor" href="#worked-example-mutex-protocol" aria-label="Permalink to &quot;Worked Example: Mutex Protocol&quot;">​</a></h2><p>Two processes want to enter a critical section. At most one should be inside at a time. We want to verify the mutual exclusion property.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spec mutex;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def lock = stock{</span></span>
<span class="line"><span>    heldByA: false,</span></span>
<span class="line"><span>    heldByB: false,</span></span>
<span class="line"><span>    available: true,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>def protocol = flow{</span></span>
<span class="line"><span>    l: new lock,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    acquireA: func{</span></span>
<span class="line"><span>        if l.available {</span></span>
<span class="line"><span>            l.heldByA = true;</span></span>
<span class="line"><span>            l.available = false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    acquireB: func{</span></span>
<span class="line"><span>        if l.available {</span></span>
<span class="line"><span>            l.heldByB = true;</span></span>
<span class="line"><span>            l.available = false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    releaseA: func{</span></span>
<span class="line"><span>        l.heldByA = false;</span></span>
<span class="line"><span>        l.available = true;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    releaseB: func{</span></span>
<span class="line"><span>        l.heldByB = false;</span></span>
<span class="line"><span>        l.available = true;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Mutual exclusion: A and B cannot both hold the lock</span></span>
<span class="line"><span>assert !(lock.heldByA &amp;&amp; lock.heldByB);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Consistency: if someone holds the lock, it is not available</span></span>
<span class="line"><span>assert when (lock.heldByA || lock.heldByB) then !lock.available;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>run init {</span></span>
<span class="line"><span>    p = new protocol;</span></span>
<span class="line"><span>} {</span></span>
<span class="line"><span>    p.acquireA | p.acquireB;</span></span>
<span class="line"><span>    p.acquireA | p.acquireB;</span></span>
<span class="line"><span>    p.releaseA | p.releaseB;</span></span>
<span class="line"><span>    p.acquireA | p.acquireB;</span></span>
<span class="line"><span>    p.acquireA | p.acquireB;</span></span>
<span class="line"><span>    p.releaseA | p.releaseB;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>The <code>|</code> operator on <code>acquireA | acquireB</code> means Fault explores both orderings — A acquires first, or B acquires first. If the guard conditions are insufficient to prevent both acquiring simultaneously, the solver will find the counterexample.</p><hr><h2 id="when-then-for-conditional-invariants" tabindex="-1"><code>when/then</code> for Conditional Invariants <a class="header-anchor" href="#when-then-for-conditional-invariants" aria-label="Permalink to &quot;\`when/then\` for Conditional Invariants&quot;">​</a></h2><p>The <code>when A then B</code> construction is the clearest way to express implication in assertions and assumptions:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assert when state.accessGranted then state.authenticated;</span></span></code></pre></div><p>This is equivalent to <code>assert !state.accessGranted || state.authenticated</code> but reads more clearly. It can be used with any temporal qualifier:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>assert when lock.heldByA then !lock.heldByB always;</span></span></code></pre></div><hr><h2 id="key-concepts" tabindex="-1">Key Concepts <a class="header-anchor" href="#key-concepts" aria-label="Permalink to &quot;Key Concepts&quot;">​</a></h2><ul><li><strong><a href="./../language-reference/special_syntax.html">Special Syntax</a></strong> — <code>when/then</code>, <code>choose</code>, <code>|</code></li><li><strong><a href="./../invariants/">Invariants</a></strong> — assertions and assumptions</li><li><strong><a href="./../data-types/">Data Types</a></strong> — booleans, strings, unknowns</li><li><strong><a href="./../language-reference/flows.html">Flows</a></strong> — flow and func syntax</li></ul>`,35)])])}const b=a(l,[["render",i]]);export{u as __pageData,b as default};
