import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@user/models';

export const ROLES_META = 'AuthorizedRoles';

export type RoleOpt = 'scrumMaster' | 'developer';

export const roles = {
  scrumMaster: [UserRole.SCRUMMASTER],
  developer: [UserRole.DEVELOPER, UserRole.SCRUMMASTER],
};

export const Roles = (role: RoleOpt) => SetMetadata(ROLES_META, roles[role]);
