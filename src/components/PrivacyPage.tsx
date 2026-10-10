import CustomHelmet from "./utils/CustomHelmet";
import PageIntro from "./utils/PageIntro";
import { NavLink } from "react-router";

// Full privacy policy. Also the privacy policy and data deletion URL for the
// Pegasus Games Video apps on Meta (Instagram), TikTok and Google (YouTube),
// so keep the "Social media" and "Delete your data" sections accurate.
const EFFECTIVE_DATE = "October 9, 2026";
const CONTACT = "hello@lovecareermagic.com";

const ext = (href: string, text: string) => (
  <a href={href} target="_blank" rel="noreferrer">
    {text}
  </a>
);

const PrivacyPage = () => {
  return (
    <div className="content max-width">
      <CustomHelmet
        title="Privacy policy"
        description="How Pegasus Games collects, uses and protects your information on lovecareermagic.com and our social media accounts."
      />

      <PageIntro title="Privacy policy" />

      <div className="subcontentWrapper min-width">
        <div className="termsWrapper">
          <p>
            <strong>Effective date:</strong> {EFFECTIVE_DATE}
          </p>
          <p>
            Pegasus Games ("we", "us") is the independent studio behind Love,
            Career & Magic, run by game designer Wonmin Lee in New York City.
            This policy explains what information we collect, why, who we share
            it with, and the choices you have. It covers lovecareermagic.com,
            our email list, orders you place with us, and our official social
            media accounts (@pegasusgamesnyc on Instagram, TikTok, YouTube and
            other platforms), including the tools we use to manage them.
          </p>
          <p>
            The short version: we collect what we need to sell and ship you a
            game, send you updates you asked for, and run our own social
            accounts. We never sell your personal information.
          </p>
          <p>
            Questions or requests: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">1. Information we collect</h2>
          <p>
            <strong>When you buy something.</strong> Your name, email address,
            shipping address, phone number (if you give one) and what you
            ordered. Payments are handled by Stripe. We never see or store your
            full card number.
          </p>
          <p>
            <strong>When you join our email list or a sign-up</strong> (the
            newsletter, a raffle, a waitlist or a free download): your email
            address, your name if you give it, and which page you signed up
            from.
          </p>
          <p>
            <strong>Automatically, when you visit the site.</strong> Your
            browser sends us standard technical information (IP address, device
            and browser type, pages viewed, the site that sent you, and campaign
            tags in the link you clicked). We and our analytics and advertising
            partners use cookies and similar technologies to collect it. See
            section 4.
          </p>
          <p>
            <strong>When you interact with our social media accounts.</strong>{" "}
            When you comment on, message or mention one of our accounts, we can
            see your public username, display name, profile picture and what
            you wrote, as on any public account. See section 3 for exactly what
            our tools access.
          </p>
          <p>
            <strong>When you contact us.</strong> Your email address and
            whatever you choose to tell us.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">2. How we use it</h2>
          <ul>
            <li>To process, ship and support your order, including returns and damaged-item claims.</li>
            <li>To send the emails you signed up for. Every email has an unsubscribe link.</li>
            <li>To reply to your comments and messages, and to send you a link you asked for.</li>
            <li>To understand which posts, ads and pages bring people to the game, so we can spend our small budget well.</li>
            <li>To keep the site and our accounts secure and to prevent fraud.</li>
            <li>To meet legal, tax and accounting obligations.</li>
          </ul>
          <p>
            If you are in the European Economic Area or the UK, our legal bases
            are: performing our contract with you (orders), your consent (email
            list, and cookies where consent is required), our legitimate
            interests in running and promoting a small business (analytics,
            replying to public comments, security), and legal obligations
            (tax records).
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">3. Social media and platform APIs</h2>
          <p>
            We use an internal tool, Pegasus Games Video, to publish videos to
            our own accounts and to reply to comments on our own posts on
            Instagram, TikTok and YouTube. It connects only to accounts owned by
            Pegasus Games, through each platform's official API. It is not
            offered to anyone else and it never logs in to your account.
          </p>
          <p>
            <strong>What it accesses:</strong> our own account's profile and
            posts, and the comments and messages people send to our accounts:
            the comment or message text, its ID and time, the post it belongs
            to, and the commenter's public username and display name.
          </p>
          <p>
            <strong>How it uses that information:</strong>
          </p>
          <ul>
            <li>To reply to comments on our own posts, for example to answer a question about the game.</li>
            <li>
              On Instagram, when a post invites you to comment a keyword to get
              a link, to send that link to you by direct message. We send one
              message per request and never message people who didn't ask.
            </li>
            <li>To publish videos we made to our own accounts.</li>
            <li>To make sure we never answer the same comment twice.</li>
          </ul>
          <p>
            We use AI-assisted tools, including Anthropic's Claude, to help
            draft replies. The text of the comment you wrote is processed to
            draft a reply. We review how replies are written and can stop the
            tool at any time.
          </p>
          <p>
            <strong>What we keep:</strong> the ID of the comment or message, the
            username, our reply and the date, stored in our private dashboard so
            we don't reply twice. We delete these records within 90 days. On
            YouTube we keep even less: only the comment's ID and link, our
            reply and the date (never your name or what you wrote), and we
            delete those records within 30 days. We do not download or keep
            copies of your profile, followers or other posts.
          </p>
          <p>
            <strong>What we never do with platform data:</strong> sell it, share
            it with advertisers or data brokers, use it to target ads, build
            profiles of people, combine it with data from other sources to
            identify you, or use it to train AI models.
          </p>
          <p>
            <strong>YouTube.</strong> Our tool uses YouTube API Services. By
            interacting with our YouTube channel you are also bound by the{" "}
            {ext("https://www.youtube.com/t/terms", "YouTube Terms of Service")}, and
            Google's handling of your data is described in the{" "}
            {ext("https://policies.google.com/privacy", "Google Privacy Policy")}.
            Our tool does not place, read or store cookies on your device. If
            you ever grant an app access to your Google account, you can
            revoke it at any time on{" "}
            {ext("https://security.google.com/settings/security/permissions", "Google's security settings page")}.
          </p>
          <p>
            <strong>Instagram and Facebook.</strong> Meta's handling of your
            data is described in the{" "}
            {ext("https://privacycenter.instagram.com/policy", "Instagram Privacy Policy")}{" "}
            and the{" "}
            {ext("https://www.facebook.com/privacy/policy", "Meta Privacy Policy")}.
          </p>
          <p>
            <strong>TikTok.</strong> TikTok's handling of your data is described
            in the{" "}
            {ext("https://www.tiktok.com/legal/privacy-policy", "TikTok Privacy Policy")}.
          </p>
          <p>
            To ask us to delete anything our tools have about you, see section
            8.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">4. Cookies, analytics and ads</h2>
          <p>The site uses:</p>
          <ul>
            <li>
              <strong>Our own cookies</strong> (<code>client_id</code> and{" "}
              <code>utm_data</code>) to remember which link brought you to the
              site, so we know which posts and ads work. They expire after 30
              days.
            </li>
            <li>
              <strong>Google Tag Manager and Google Analytics</strong> to count
              visits and see how people use the site.
            </li>
            <li>
              <strong>Microsoft Clarity</strong> to see where people click and
              get stuck, through heatmaps and session replays. Clarity masks
              what you type into forms.
            </li>
            <li>
              <strong>The Meta Pixel and Meta Conversions API</strong> to
              measure our Facebook and Instagram ads and show them to people
              likely to enjoy the game. When you complete a purchase, we send
              Meta a scrambled (hashed) version of your email address, your IP
              address and browser type, so Meta can match the purchase to an
              ad. Meta cannot read your email address from the hash.
            </li>
          </ul>
          <p>
            You can block or delete cookies in your browser settings, and the
            site still works. You can also manage ad personalization in your{" "}
            {ext("https://accountscenter.facebook.com/ad_preferences", "Meta ad preferences")}{" "}
            and{" "}
            {ext("https://myadssettings.google.com/", "Google ad settings")}, and
            opt out of Google Analytics with Google's{" "}
            {ext("https://tools.google.com/dlpage/gaoptout", "opt-out add-on")}.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">5. Who we share it with</h2>
          <p>
            We don't sell your personal information for money. We share it only
            with the services that help us run the business, and only what each
            one needs:
          </p>
          <ul>
            <li><strong>Stripe</strong> (payments).</li>
            <li><strong>Shippo</strong> and postal carriers such as USPS and UPS (shipping labels and delivery).</li>
            <li><strong>Our fulfillment partner in Europe</strong> (name, address and order for European orders only).</li>
            <li><strong>TikTok Shop</strong> (if you order through it; TikTok's own policy also applies).</li>
            <li><strong>MailerLite</strong> (our email list).</li>
            <li><strong>Google</strong> (Workspace email, Tag Manager, Analytics) and <strong>Microsoft</strong> (Clarity).</li>
            <li><strong>Meta</strong> (ad measurement, as described in section 4).</li>
            <li><strong>Netlify</strong> (website hosting).</li>
            <li><strong>Anthropic</strong> (AI assistance, as described in section 3).</li>
          </ul>
          <p>
            We may also disclose information if the law requires it, to protect
            our rights or someone's safety, or as part of a sale or transfer of
            the business. Under some US state laws, letting advertising
            partners like Meta use cookies to show you ads can count as
            "sharing" for targeted advertising. To opt out, block cookies in
            your browser, or email us and we'll exclude your email address
            from the information we send Meta.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">6. How long we keep it</h2>
          <ul>
            <li>Order records: as long as tax and accounting rules require, usually up to 7 years.</li>
            <li>Email list: until you unsubscribe or ask us to delete it.</li>
            <li>Social media reply records: up to 90 days (YouTube: up to 30 days).</li>
            <li>Our own cookies: 30 days. Analytics and ad partners keep data according to their own settings and policies.</li>
            <li>Emails with us: as long as needed to help you, then deleted when no longer needed.</li>
          </ul>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">7. Your rights</h2>
          <p>
            Wherever you live, you can ask us to tell you what we have about
            you, correct it, delete it, or stop sending you emails. Depending
            on where you live (for example the EEA, the UK, California and
            other US states), you may also have the right to get a copy of your
            data, restrict or object to how we use it, withdraw consent at any
            time, and opt out of targeted advertising. We won't treat you
            differently for using these rights.
          </p>
          <p>
            Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We may ask you to
            confirm it's you, and we answer within 30 days. If you're in the
            EEA or UK and unhappy with our answer, you can complain to your
            local data protection authority.
          </p>
        </div>

        <div className="termsWrapper" id="delete-your-data">
          <h2 className="subtitle">8. Delete your data</h2>
          <p>
            To delete the information we have about you, including anything our
            tools stored from your comments or messages on Instagram, TikTok or
            YouTube:
          </p>
          <ol>
            <li>
              Email <a href={`mailto:${CONTACT}?subject=Delete%20my%20data`}>{CONTACT}</a>{" "}
              with the subject "Delete my data".
            </li>
            <li>
              Include the email address you used with us and/or your username
              on the platform (for example your Instagram handle).
            </li>
            <li>
              We delete it within 30 days and email you when it's done. We keep
              only what the law requires, such as order records for taxes.
            </li>
          </ol>
          <p>
            You can also delete your own comment on the platform at any time,
            and remove an app's access from your Instagram, TikTok or Google
            account settings.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">9. Children</h2>
          <p>
            Our site and accounts are not directed to children under 13 (under
            16 in the EEA and UK), and we don't knowingly collect their personal
            information. If you think a child has given us information, email
            us and we'll delete it.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">10. Security and international transfers</h2>
          <p>
            We use reputable providers, encrypted connections and limited
            access to protect your information. No system is perfectly secure,
            but we only keep what we need. We're based in the United States,
            and our providers may process information in the US and other
            countries. Where the law requires it, they use safeguards such as
            Standard Contractual Clauses.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">11. Changes</h2>
          <p>
            If we change this policy, we'll update the effective date at the
            top. If a change is significant, we'll also tell our email list.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">12. Contact</h2>
          <p>
            Pegasus Games, New York, NY, USA
            <br />
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </p>
          <p>
            See also our <NavLink to="/terms">terms and return policy</NavLink>.
          </p>
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <p style={{ marginTop: "1em" }}>
            <NavLink to="/">Click here to go back home.</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
