const footerLinks = [
  "College Spring",
  "SoFlo Tutors",
  "PrepPros",
  "Summit Prep",
  "Krunnick",
  "Torch Prep",
  "Khan Academy",
  "College Board",
];

export function Footer() {
  return (
    <footer
      className="w-full py-5 px-4 sm:px-6"
      style={{
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #ebebeb",
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {footerLinks.map((link) => (
          <a
            key={link}
            href="#"
            style={{ color: "#bbb", fontSize: 12 }}
            className="hover:text-gray-500 transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
      <p className="text-center mt-4" style={{ color: "#e0e0e0", fontSize: 11 }}>
        © 2026 MilliyMock. Barcha huquqlar himoyalangan.
      </p>
    </footer>
  );
}
