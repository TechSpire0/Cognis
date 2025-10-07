"""create chat_sessions table

Revision ID: 797204d4f1bb
Revises: 60211ef21f4e
Create Date: 2025-10-07 19:05:02.575428
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '797204d4f1bb'
down_revision = '60211ef21f4e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'chat_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('ufdr_file_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('ufdr_files.id', ondelete='CASCADE'), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('messages', postgresql.JSONB(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'),
                  onupdate=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('chat_sessions')
