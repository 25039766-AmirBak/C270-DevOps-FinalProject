.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  background: var(--color-paper);
  border-bottom: 1px solid var(--color-line);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-forest);
  text-decoration: none;
}

.nav-logo span {
  color: var(--color-amber-dark);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-links a {
  text-decoration: none;
  color: var(--color-ink);
  font-weight: 500;
  font-size: 15px;
}

.nav-cta {
  background: var(--color-forest);
  color: white !important;
  padding: 10px 20px;
  border-radius: 999px;
  font-weight: 600 !important;
}

@media (max-width: 640px) {
  .nav-bar {
    padding: 16px 20px;
  }
}
