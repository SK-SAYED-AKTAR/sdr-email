"""add sent_at to prospects

Revision ID: acfd464142dc
Revises: e1c30151226f
Create Date: 2026-07-23 00:48:59.849883

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'acfd464142dc'
down_revision: Union[str, Sequence[str], None] = 'e1c30151226f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("prospects", sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("prospects", "sent_at")
