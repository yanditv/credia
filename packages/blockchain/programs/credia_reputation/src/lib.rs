use anchor_lang::prelude::*;

declare_id!("DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o");

// Hackathon scope: admin único alineado con la wallet local del provider de Anchor.
// Reemplazar por multisig o governance antes de producción.
pub const ADMIN_PUBKEY: Pubkey = pubkey!("HwCUQk4QKvDweRpmDZdEc4tLVDnUm6ZkBHQ2ZXxWmN7C");

#[error_code]
pub enum CrediaError {
    #[msg("El prestamo no esta activo")]
    LoanNotActive,
    #[msg("El prestamo ya fue pagado")]
    AlreadyPaid,
    #[msg("La wallet firmante no coincide con el admin autorizado")]
    InvalidAdmin,
}

#[program]
pub mod credia_reputation {
    use super::*;

    pub fn init_reputation(ctx: Context<InitReputation>, score_hash: [u8; 32]) -> Result<()> {
        let user_reputation = &mut ctx.accounts.user_reputation;
        user_reputation.wallet = *ctx.accounts.authority.key;
        user_reputation.score_hash = score_hash;
        user_reputation.status = ReputationStatus::Pending;
        user_reputation.created_at = Clock::get()?.unix_timestamp;
        user_reputation.bump = ctx.bumps.user_reputation;
        Ok(())
    }

    pub fn update_score_hash(
        ctx: Context<UpdateScoreHash>,
        score_hash: [u8; 32],
        status: ReputationStatus,
    ) -> Result<()> {
        let user_reputation = &mut ctx.accounts.user_reputation;
        user_reputation.score_hash = score_hash;
        user_reputation.status = status;
        Ok(())
    }

    pub fn create_loan_record(
        ctx: Context<CreateLoanRecord>,
        loan_id_hash: [u8; 32],
        amount_hash: [u8; 32],
    ) -> Result<()> {
        let loan_record = &mut ctx.accounts.loan_record;
        loan_record.user_wallet = ctx.accounts.target_wallet.key();
        loan_record.loan_id_hash = loan_id_hash;
        loan_record.amount_hash = amount_hash;
        loan_record.status = LoanStatus::Active;
        loan_record.created_at = Clock::get()?.unix_timestamp;
        loan_record.bump = ctx.bumps.loan_record;
        Ok(())
    }

    pub fn register_payment(
        ctx: Context<RegisterPayment>,
        payment_hash: [u8; 32],
        amount_hash: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.loan_record.status == LoanStatus::Active,
            CrediaError::LoanNotActive
        );

        let payment_record = &mut ctx.accounts.payment_record;
        payment_record.loan = ctx.accounts.loan_record.key();
        payment_record.payer = *ctx.accounts.authority.key;
        payment_record.payment_hash = payment_hash;
        payment_record.amount_hash = amount_hash;
        payment_record.status = PaymentStatus::Completed;
        payment_record.created_at = Clock::get()?.unix_timestamp;
        payment_record.bump = ctx.bumps.payment_record;
        Ok(())
    }

    pub fn close_loan(ctx: Context<CloseLoan>) -> Result<()> {
        require!(
            ctx.accounts.loan_record.status == LoanStatus::Active,
            CrediaError::LoanNotActive
        );

        let loan_record = &mut ctx.accounts.loan_record;
        loan_record.status = LoanStatus::Paid;
        Ok(())
    }

    pub fn mark_default(ctx: Context<MarkDefault>) -> Result<()> {
        require!(
            ctx.accounts.loan_record.status == LoanStatus::Active,
            CrediaError::LoanNotActive
        );

        let loan_record = &mut ctx.accounts.loan_record;
        loan_record.status = LoanStatus::Defaulted;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitReputation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1 + 8 + 1,
        seeds = [b"reputation", authority.key().as_ref()],
        bump
    )]
    pub user_reputation: Account<'info, UserReputation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScoreHash<'info> {
    /// CHECK: wallet del usuario cuyo score se actualiza; solo se usa como semilla del PDA.
    pub target_wallet: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"reputation", target_wallet.key().as_ref()],
        bump = user_reputation.bump,
    )]
    pub user_reputation: Account<'info, UserReputation>,
    #[account(constraint = admin.key() == ADMIN_PUBKEY @ CrediaError::InvalidAdmin)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(loan_id_hash: [u8; 32], amount_hash: [u8; 32])]
pub struct CreateLoanRecord<'info> {
    /// CHECK: wallet del usuario dueño del préstamo; solo se usa como semilla y referencia.
    pub target_wallet: UncheckedAccount<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 32 + 1 + 8 + 1,
        seeds = [b"loan", target_wallet.key().as_ref(), loan_id_hash.as_ref()],
        bump
    )]
    pub loan_record: Account<'info, LoanRecord>,
    #[account(mut)]
    #[account(constraint = admin.key() == ADMIN_PUBKEY @ CrediaError::InvalidAdmin)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPayment<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 1 + 8 + 1,
        seeds = [b"payment", loan_record.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub payment_record: Account<'info, PaymentRecord>,
    #[account(
        mut,
        seeds = [b"loan", loan_record.user_wallet.as_ref(), loan_record.loan_id_hash.as_ref()],
        bump = loan_record.bump,
    )]
    pub loan_record: Account<'info, LoanRecord>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseLoan<'info> {
    /// CHECK: wallet del usuario dueño del préstamo; solo se usa como semilla del PDA.
    pub target_wallet: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"loan", target_wallet.key().as_ref(), loan_record.loan_id_hash.as_ref()],
        bump = loan_record.bump,
    )]
    pub loan_record: Account<'info, LoanRecord>,
    #[account(constraint = admin.key() == ADMIN_PUBKEY @ CrediaError::InvalidAdmin)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct MarkDefault<'info> {
    /// CHECK: wallet del usuario dueño del préstamo; solo se usa como semilla del PDA.
    pub target_wallet: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"loan", target_wallet.key().as_ref(), loan_record.loan_id_hash.as_ref()],
        bump = loan_record.bump,
    )]
    pub loan_record: Account<'info, LoanRecord>,
    #[account(constraint = admin.key() == ADMIN_PUBKEY @ CrediaError::InvalidAdmin)]
    pub admin: Signer<'info>,
}

#[account]
pub struct UserReputation {
    pub wallet: Pubkey,
    pub score_hash: [u8; 32],
    pub status: ReputationStatus,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct LoanRecord {
    pub user_wallet: Pubkey,
    pub loan_id_hash: [u8; 32],
    pub amount_hash: [u8; 32],
    pub status: LoanStatus,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct PaymentRecord {
    pub loan: Pubkey,
    pub payer: Pubkey,
    pub payment_hash: [u8; 32],
    pub amount_hash: [u8; 32],
    pub status: PaymentStatus,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReputationStatus {
    Pending,
    Active,
    Suspended,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LoanStatus {
    Active,
    Paid,
    Defaulted,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Pending,
    Completed,
    Failed,
}
