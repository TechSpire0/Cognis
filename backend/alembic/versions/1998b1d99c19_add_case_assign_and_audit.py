from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1998b1d99c19'
down_revision = 'ba8fc746b367'
branch_labels = None
depends_on = None

def upgrade():
    # create case_assignments
    op.create_table(
        'case_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.UniqueConstraint('case_id', 'user_id', name='uq_case_user')
    )

    # add audit log columns
    op.add_column('audit_logs', sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('audit_logs', sa.Column('ip_address', sa.String(length=45), nullable=True))
    op.add_column('audit_logs', sa.Column('action_type', sa.String(length=50), nullable=True))

    # add ufdr soft-delete columns
    op.add_column('ufdr_files', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('ufdr_files', sa.Column('deleted_at', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('ufdr_files', 'deleted_at')
    op.drop_column('ufdr_files', 'is_deleted')
    op.drop_column('audit_logs', 'action_type')
    op.drop_column('audit_logs', 'ip_address')
    op.drop_column('audit_logs', 'user_id')
    op.drop_table('case_assignments')
