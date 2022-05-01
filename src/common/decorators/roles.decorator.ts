import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/constants';

export const ROLES_META = 'AuthorizedRoles';

export type RoleOpt = 'scrumMaster' | 'developer';

export const roles = {
  scrumMaster: [UserRoles.SCRUMMASTER],
  developer: [UserRoles.DEVELOPER, UserRoles.SCRUMMASTER],
};

export const Roles = (role: RoleOpt) => SetMetadata(ROLES_META, roles[role]);
