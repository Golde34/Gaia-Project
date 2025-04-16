import React from "react";
import {
	ArrowUpIcon,
	BellIcon,
	BookmarkIcon,
	CalendarIcon,
	ClipboardCheckIcon,
	ExternalLinkIcon,
	HomeIcon,
	MailIcon,
	PencilAltIcon,
	ShieldCheckIcon,
	UserIcon,
} from "@heroicons/react/solid";
import { Button, Col, Grid } from "@tremor/react";
import styled from "styled-components";

const Description = styled.div`
  display: none;
  position: absolute;
  background-color: #111827;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  border-radius: 8px;
  top: -20px;
  left: 50px;
  color: white;
`;

const LinkWrapper = styled.a`
  &:hover ${Description} {
    display: block;
  }
`;

const Sidebar = () => {
	return (
		<>
			<div className="fixed left-3 sm:left-6 top-[100px]">
				<Grid numItems={1}>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/dashboard">
							<Button variant="primary" color="red"
								className="p-2 rounded-lg mb-4">
								<HomeIcon width={20} />
							</Button>
							<Description>Dashboard</Description>
						</LinkWrapper>
					</Col>
					{/* <Col numColSpan={1}>
						<LinkWrapper href="/client-gui/user-task-connector">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<TemplateIcon width={20} />
							</Button>
							<Description>Task Registration</Description>
						</LinkWrapper>
					</Col> */}
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/profile">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<UserIcon width={20} />
							</Button>
							<Description>User Profile</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/project">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<ClipboardCheckIcon width={20} />
							</Button>
							<Description>Project</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/schedule">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<CalendarIcon width={20} />
							</Button>
							<Description>Schedule Calendar</Description>
						</LinkWrapper>
					</Col>
					<Col numColSpan={1}>
						<LinkWrapper href="/client-gui/note-dashboard">
							<Button variant="primary" color="indigo"
								className="p-2 rounded-lg mb-4">
								<BookmarkIcon width={20} />
							</Button>
							<Description>Note </Description>
						</LinkWrapper>
					</Col>
				</Grid>
				 <PencilAltIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/>
				
				{/*<ChartBarIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/>
				<DocumentSearchIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/> 
				<MailIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/>
				<a href="/client-gui/scheduling-table">
					<CreditCardIcon
						width={40}
						className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
					/>
				</a> */}
				<BellIcon
					width={40}
					className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
				/>
				<Col numColSpan={1}>
					<LinkWrapper href="/client-gui/manager">
						<Button variant="primary" color="yellow"
							className="p-2 rounded-lg mb-4">
							<ShieldCheckIcon width={20} />
						</Button>
						<Description>Manager</Description>
					</LinkWrapper>
				</Col>
			</div>
			<div className="fixed bottom-4 left-3 sm:left-6">
				<a href="#top">
					<ArrowUpIcon
						width={40}
						className="bg-gray-600 p-2 rounded-lg mb-4 text-gray-300"
					/>
				</a>
				<Button variant="secondary" className="p-2" color="indigo" >
					<ExternalLinkIcon width={20} />
				</Button>
			</div>
		</>
	);
};

export default Sidebar;