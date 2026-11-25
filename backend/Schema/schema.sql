
-- table for user creation
CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(250) NOT NULL UNIQUE ,
    username VARCHAR(250) NOT NULL UNIQUE,
    password_hash VARCHAR(250) NOT NULL ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- login table
CREATE TABLE login_entries(
    login_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    loggedin_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_At TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hr'),
    loggedout_At TIMESTAMPTZ 
)
-- service_platform_plans
CREATE TABLE service_platform_plans(
    service_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(250) NOT NULL UNIQUE,
    monthly_price NUMERIC(10, 2) NOT NULL CHECK (monthly_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)



-- provider_subscription

CREATE TABLE provider_subscription (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,

    selected_services JSONB NOT NULL,

    base_amount NUMERIC(10,2) NOT NULL CHECK (base_amount >= 0),
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    gst_amount NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,

    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),

    subscription_status TEXT NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (expires_at > started_at),
    CHECK (total_amount = base_amount + gst_amount)
);

-- subcription history
CREATE TABLE subscription_history(
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL
        REFERENCES provider_subscription(subscription_id) ON DELETE CASCADE,
    user_id UUID NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    selected_services JSONB NOT NULL,

    base_amount NUMERIC(10, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL,
    gst_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,

    started_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    transaction_type VARCHAR(20) NOT NULL
        CHECK (transaction_type IN ('creation', 'renewal')),

    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
