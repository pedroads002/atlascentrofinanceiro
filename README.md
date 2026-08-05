# Atlas: Seu Centro Financeiro

You are a Senior Product Designer, UX Designer, Software Architect, and Full Stack Engineer.

Your mission is to build a complete personal financial management system called **Atlas**.

IMPORTANT:

This system is NOT intended for commercial use.

It is a private system for a single user only.

The goal is NOT simply to record expenses.

The goal is to provide complete financial clarity and help the user make better financial decisions every day.

==================================================

GENERAL RULES

==================================================

- Entire interface MUST be in Portuguese (Brazil).

- All dates, currencies and formats must follow Brazilian standards.

- Currency: Brazilian Real (R$).

- Decimal separator: comma.

- Date format: DD/MM/YYYY.

Design language:

Premium SaaS.

Inspired by:

- Apple

- Linear

- Stripe

- Notion

Characteristics:

- Extremely clean

- Modern

- Minimalistic

- Elegant

- Fast

- Spacious layout

- Large cards

- Excellent typography

- Beautiful animations

- No visual clutter

==================================================

THEMES

==================================================

Implement:

✔ System Theme

✔ Light Theme

✔ Dark Theme

The user can switch anytime.

Persist the chosen theme.

==================================================

COLOR PALETTE

==================================================

Primary:

#00D84A

Dark:

#0B0B0B

White:

#FFFFFF

Neutral grays.

The design must follow Herval Marketing's visual identity:

Black

Green

White

Green should be used ONLY for highlights, confirmations and important actions.

==================================================

LOGO

==================================================

Use the attached logo.

It must appear:

- Login page

- Sidebar

- Splash/Header

Respect proportions.

Do not redesign it.

==================================================

LAYOUT

==================================================

Desktop-first.

Responsive.

Works perfectly on:

Desktop

Tablet

Mobile

Left sidebar.

Top navigation.

Premium dashboard.

==================================================

MODULES

==================================================

1. Dashboard

Must display:

- Saldo atual

- Saldo disponível

- Receitas do mês

- Despesas do mês

- Economia do mês

- Meta mensal

- Projeção de saldo

- Contas vencendo

- Contas atrasadas

- Gastos do dia

- Fluxo de caixa resumido

==================================================

2. Financial Transactions

Fast creation.

Types:

Receita

Despesa

Transferência

Parcelamento

Reembolso

Fields:

Descrição

Valor

Categoria

Conta

Forma de pagamento

Observações

Data

==================================================

3. Fixed Expenses

Monthly recurring expenses.

Examples:

Aluguel

Internet

Energia

Água

Condomínio

Academia

Plano de saúde

==================================================

4. Credit Cards

Support multiple cards.

Each card shows:

Current bill

Next bill

Limit

Available limit

Installments

Expenses

==================================================

5. Installments

Track every installment.

Display:

Original amount

Monthly amount

Remaining installments

End date

==================================================

6. Categories

Custom categories.

Examples:

Uber

Mercado

Cigarro

Café

iFood

Farmácia

Combustível

Lazer

Investimentos

==================================================

7. Financial Calendar

Monthly calendar.

Display:

Due bills

Payments

Income

Installments

==================================================

8. Goals

Financial goals.

Examples:

Reserva de emergência

Notebook

Viagem

Carro

Apartamento

Progress bars.

==================================================

9. Reports

Interactive charts.

By:

Month

Category

Card

Account

Payment method

==================================================

10. Monthly Summary

Automatic summary:

Receitas

Despesas

Economia

Maior gasto

Maior categoria

==================================================

SMART PANELS

==================================================

Create exclusive dashboard widgets.

"Para onde foi meu dinheiro?"

Show ranking.

Example:

Uber

Cigarro

Mercado

iFood

"Quanto custa viver?"

Calculate fixed monthly cost.

"Se continuar assim..."

Estimate end-of-month balance.

==================================================

USER EXPERIENCE

==================================================

The system must be extremely fast.

Adding an expense should take less than 10 seconds.

Keyboard shortcuts are welcome.

Search everywhere.

Smooth transitions.

==================================================

AI (Prepare Architecture)

==================================================

Do NOT fully implement AI now.

Prepare the architecture.

Create an AI Assistant section.

Future AI will answer questions like:

- Quanto gastei com Uber este mês?

- Quanto economizei?

- Quanto posso gastar hoje?

- Onde estou gastando mais?

- Qual categoria mais cresceu?

Only prepare the structure.

==================================================

DATABASE

==================================================

Structure the project so future AI can access all financial records.

==================================================

FINAL GOAL

==================================================

This should NOT feel like a spreadsheet.

It should feel like a premium financial command center.

Every screen should answer one question:

"How is my financial health today, and what is the best decision I can make right now?"

Generate the complete application with production-quality architecture, beautiful UI, reusable components, scalable structure and an exceptional user experience.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://atlascentrofinanceiro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e9cfc41b-6952-4b0d-a5d0-1688b729e759).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
