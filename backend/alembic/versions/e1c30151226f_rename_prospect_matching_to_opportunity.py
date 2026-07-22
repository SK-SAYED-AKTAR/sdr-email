"""rename prospect matching to opportunity

Revision ID: e1c30151226f
Revises: d23ee632523a
Create Date: 2026-07-22 11:57:50.294389

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1c30151226f'
down_revision: Union[str, Sequence[str], None] = 'd23ee632523a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("prospects", "matching", new_column_name="opportunity")
    op.execute("ALTER TYPE prospect_status RENAME VALUE 'MATCHING' TO 'ANALYZING_OPPORTUNITY'")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE prospect_status RENAME VALUE 'ANALYZING_OPPORTUNITY' TO 'MATCHING'")
    op.alter_column("prospects", "opportunity", new_column_name="matching")
