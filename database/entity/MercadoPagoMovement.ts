import {DetailedMovement} from 'checksync-scraper/scraper/mercadoPago/types';
import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class MercadoPagoMovement implements DetailedMovement {
	@PrimaryColumn()
	id: DetailedMovement['id'] = 's';
	@Column()
	status: DetailedMovement['status'];
	@Column()
	userName: DetailedMovement['userName'];
	@Column()
	userDetails: DetailedMovement['userDetails'];
	@Column()
	type: DetailedMovement['type'];
	@Column()
	link: DetailedMovement['link'];
	@Column()
	date: DetailedMovement['date'];
	@Column()
	url: DetailedMovement['url'];
	@Column()
	amount: DetailedMovement['amount'];
}
